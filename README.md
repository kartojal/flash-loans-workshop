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
yarn start
```

```
ALCHEMY_RPC="YOUR ALCHEMY RPC URL" yarn fork
```

```
yarn deploy
```

A browser should start pointing to http://localhost:3000 with a minimal frontend.

## Made possible by

This project uses [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) for fast bootstrapping. Thanks @austintgriffith!
