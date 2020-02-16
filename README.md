# SAML x Web3
Integration between SAML (protocol for enterprise authentication) and Web3 (via hardware wallets)

[Presentation](https://docs.google.com/presentation/d/1xvEV798BM1Z1e2qmHxl_XLo3E_Rvy5KG7dtz1q6L7vs/edit?usp=sharing)

## Team

Greg Taschuk

George Weiler

## Description

This project implements a SAML identity provider, so organizations can manage users across Web2 and Web3.  This enables employees to sign into thousands of enterprise services via an ethereum wallet (we used the ShapeShift KeepKey) and enables organizations to manage in different groups.  The ethereum smart contract that manages user permissions is a bitmask-rbac - maintaining roles that an employee might have in an organization and providing a natively ethereum way to manage their interaction with Ethereum contracts.

## Context

This project was built for the Open Track of EthDenver

This project uses a [Role Based Access Control](https://truset.github.io/bitmask-rbac/) to manage the roles a user might have in an organization (which can be made available to SAML Service Providers)

## Project Bounties

[ShapeShift - Building with HDWallet](https://alchemy-xdai.daostack.io/dao/0x2e9d79165ddb22e67742789cc553e95722f96f0b/scheme/0x955bdfc50bed698333e68f8598b078e9d6234c0bb2fc508478129b71943aa2ac/crx) - Our platform leverages HDWallet to allow users to prove identity with a KeepKey by signing an ethereum message


[3Box - Best overall 3Box Integration](https://alchemy-xdai.daostack.io/dao/0x8766cab508a87536b8691ace8814b517b95f7b75/crx/proposal/0xa60ed7859e67185976e244d7452594850bce0c62be6470afff40588390cb2264) Our platform leverages 3Box to maintain user data such as a name, location etc to give to SAML Service Providers and cut down on redundant application profile creation

[UX Awards](https://alchemy-xdai.daostack.io/dao/0xafa82df1cd041d93655d474062e42929471ea69a/crx/proposal/0xc8adb80cd42cb34f4908d88c87950ee64e6fe0bcc213c65b47a22eae75fa7bc2) Uniting Web2 and Web3 authentication significantly eases organizations adoption of new decentralized paradigms
