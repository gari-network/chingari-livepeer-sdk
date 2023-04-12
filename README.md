## Installation Steps
--------
``
```javascript 
npm install chingari-livepeer
```
``

OR

``
```javascript
yarn install chingari-livepeer
```
``

## Usage
--------
**Create Signature**

Signs a message using the user's private key and return signature.
<br />

``
```javascript
const signature = await chingariLivepeer.createSignature(privateKey: string, message: string)
```
``
<br />


**Web3 Auth**

Verify signature and authorize user
<br />

``
```javascript
const isVerified = await chingariLivepeer.web3Auth(
    publicKey: string, 
    signature: string, 
    message: string
)
```
``
<br />


**Is Sufficient Balance**

Checks if the user has minimum required balance by coinType
<br />

``
```javascript
const isSufficientBalance = await chingariLivepeer.isSufficientBalance(
    account: string, 
    minimumBalance: number,
    extraArgs?: {coinType?: string},
)
```
``
<br />


**Upload video asset with URL**

``
```javascript
const response = await uploadAssetWithURL(
    API_TOKEN: string, EXTERNAL_URL: string, Name: string
)
```
``
<br />


**Fetch asset info**

``
```javascript
const response = await fetchAssetInfo(
    API_TOKEN: string, assetId: string
)
```
``
<br />


**Check Asset Ready**

``
```javascript
const response = await checkAssetReady(
    API_TOKEN: string, assetId: string
)
```
``
<br />


**Upload video on Livepeer**


``
```javascript
const response = await uploadOnIPFS(
    API_TOKEN: string, assetId: string
)
```
``
<br />


**Create NFT using Livepeer and Aptos**


``
```javascript
const response = await createNFT(
    issuerPK: string, metadataURI: string
)
```
``
