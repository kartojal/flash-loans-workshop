# Flash loans Workshop

This workshop serves an example about how to integrate Aave V2 flash loans to liquidate a loan from an unhealthy borrower position.

# Get started

Open a terminal,clone this repository and Install dependencies

```
git clone git@github.com:kartojal/flash-loans-workshop.git

cd flash-loans-workshop

yarn
```

Open three terminals, and run the following in each terminal:

```
ALCHEMY_RPC="YOUR ALCHEMY RPC URL" yarn fork
```

```
yarn deploy
```

Check the first terminal after the deploy command, and wait until the Hardhat node loads all the state for the fork environment, could take some minutes. Once the node terminal stops syncing data and the logs are paused, them run the frontend with the following command:

```
yarn start
```


A browser should start pointing to http://localhost:3000 with a minimal frontend and with a pre-loaded wallet.

## Made possible by

This project uses [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) for fast bootstrapping. Thanks @austintgriffith!
