import { NODE_URL, COLLECTION_NAME, COLLECTION_DESCRIPTION, COLLECTION_URI, TOKEN_DESCRIPTION, TOKEN_VERSION } from './constants';
import { AptosClient, TokenClient, AptosAccount, HexString } from 'aptos';
import RequestPromise from 'request-promise';

export const uploadAssetWithURL = async (API_TOKEN: string, EXTERNAL_URL: string, Name: string) => {
    try {
        const options = {
            "method": "POST",
            "url": "https://livepeer.studio/api/asset/import",
            "headers": {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": " application/json"
            },
            "body": JSON.stringify({
                "url": EXTERNAL_URL,
                "name": Name
            })
        }

        const response = await RequestPromise(options)
        return response
    } catch (err: any) {
        return err.error
    }
}

export const fetchAssetInfo = async (API_TOKEN: string, assetId: string) => {
    try {
        const options = {
            "method": "GET",
            "url": `https://livepeer.studio/api/asset/${assetId}`,
            "headers": {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": " application/json"
            }
        }
        const response = await RequestPromise(options)
        return JSON.parse(response)
    } catch (err: any) {
        return err.error
    }
}

export const checkAssetReady = async (API_TOKEN: string, assetId: string): Promise<boolean> => {
    const assetInfo = await fetchAssetInfo(API_TOKEN, assetId)
    return JSON.parse(assetInfo).status.phase === "ready" ? true : false
}

export const uploadOnIPFS = async (API_TOKEN: string, assetId: string) => {
    try {
        const options = {
            "method": "PATCH",
            "url": `https://livepeer.studio/api/asset/${assetId}`,
            "headers": {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": " application/json"
            },
            "body": JSON.stringify({
                storage: { ipfs: true }
            })
        }
        const response = await RequestPromise(options)
        return JSON.parse(response)
    } catch (err: any) {
        return JSON.parse(err.error)
    }
}

export const createNFT = async (issuerPK: string, metadataURI: string) => {
    try {
        const client = new AptosClient(NODE_URL);
        const tokenClient = new TokenClient(client);

        const issuer = new AptosAccount(
            new HexString(issuerPK).toUint8Array(),
        );

        let collectionData: any;
        try {
            collectionData = await tokenClient.getCollectionData(
                issuer.address(),
                COLLECTION_NAME,
            );
            console.log("collectionData =>", collectionData);

        } catch (e) {
            console.log("in catch");

            // if the collection does not exist, we create it
            const createCollectionHash = await tokenClient.createCollection(
                issuer,
                COLLECTION_NAME,
                COLLECTION_DESCRIPTION,
                COLLECTION_URI,
            );
            await client.waitForTransaction(createCollectionHash, {
                checkSuccess: true,
            });

            collectionData = await tokenClient.getCollectionData(
                issuer.address(),
                COLLECTION_NAME,
            );
        }

        const tokenName = `Chingari Video NFT ${Number(collectionData?.supply ?? 0) + 1}`;

        const createTokenHash = await tokenClient.createToken(
            issuer,
            COLLECTION_NAME,
            tokenName,
            TOKEN_DESCRIPTION,
            1,
            metadataURI
        );
        await client.waitForTransaction(createTokenHash, { checkSuccess: true });
        return {
            creator: issuer.address().hex(),
            collectionName: COLLECTION_NAME,
            tokenName,
            tokenPropertyVersion: TOKEN_VERSION,
        }
    } catch (err) {
        return err
    }
}

const fetchStatusInterval = async (livepeerToken: string, assetId: string) => {
    return new Promise( (resolve, reject) => {

        const inter = setInterval(async () => {
            let status
            const info = await fetchAssetInfo(livepeerToken, assetId)
        
            if (info.status.phase == "ready" || info.status.phase == "failed") {
                status = info.status.phase == "ready" ? true : false;
                clearInterval(inter)
                resolve(status)
            }
        }, 15000)
    })
}

const fetchIPFSInterval = async (livepeerToken: string, assetId: string): Promise<string> => {
    return new Promise( (resolve, reject) => {

        const inter = setInterval(async () => {
            let value: string
            const info = await fetchAssetInfo(livepeerToken, assetId)

            if (typeof info.storage.ipfs.gatewayUrl !== "undefined") {
                value = info.storage.ipfs.gatewayUrl
                clearInterval(inter)
                resolve(value)
            }
        }, 15000)
    })
}

export const uploadVideoAndMintNFT = async ({ livepeerToken, assetURL, assetName, issuerPrivateKey }
    : {
        livepeerToken: string,
        assetURL: string,
        assetName: string,
        issuerPrivateKey: string
    }) => {
    try {
        let uploadAsset = await uploadAssetWithURL(livepeerToken, assetURL, assetName)
        uploadAsset = JSON.parse(uploadAsset)

        if (typeof uploadAsset.asset != "undefined") {

            let info = await fetchStatusInterval(livepeerToken, uploadAsset.asset.id)

            if (info) {
                const ipfsUpload = await uploadOnIPFS(livepeerToken, uploadAsset.asset.id)

                const gatewayUrl: string = await fetchIPFSInterval(livepeerToken, ipfsUpload.id)
                const nftdata = await createNFT(issuerPrivateKey, gatewayUrl)
                return nftdata
            } else {
                return "Video Upload Failed!"
            }
        }
        else { return "got some error" }
    }
    catch (err) {
        return err
    }
}