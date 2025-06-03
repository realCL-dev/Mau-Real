## `This project is an adaptation of DAPP University's tutorial on Zillow, a Real State site on the Blockchain (https://www.youtube.com/watch?v=jcgfQEbptdo&t) `

### `npx hardhat node`
This will launch a local blockchain node, each with 10,000 ETH.

### `npx hardhat ignition deploy ignition/modules/RealEstate.js --network localhost`
Run the above in a new terminal. This will deploy the RealEstate (NFT) smart contract.

### `npx hardhat ignition deploy ignition/modules/Escrow.js --network localhost`
This will deploy the Escrow Smart Contract

### `npx hardhat run scripts/deploy.js --network localhost`
To deploy the script minting the three NFTs.

### `npm run start`
Run the above in a new terminal. This will launch the site.

### `Import the Hardhat Accounts`
Ensure that you import the first 4 Hardhat accounts from the local node, using their private keys. Rename them as Hardhat#0 to Hardhat#3

### `Using hardhat#3`
Hardhat#3 is the buyer. Select one of the homes (e.g. Spanish Villa) and click on "Buy". Click twice on MetaMask, once to send the deposit funds, and once to approve the sales.

### `Using hardhat#1`
Hardhat#1 is the Valuator. Click once on MetaMask to approve the valuation.

### `Using hardhat#2`
Hardhat#2 is the Lender (bank). Click twice on MetaMask, once to approve the sale, and once to send the remainder of the funds to the Escrow Account.

### `Using hardhat#0`
Hardhat#0 is the seller. Click twice on MetaMask, once to approve the sale, and once to finalize the sale. The NFT will be shown as owned by account Hardhat#3. 
Verify also that the seller's account is credited with the right amount of ETH, and that the buyer and lender accounts are debited by the required amounts.
