# 🎥 Fan-Led Funding for Indie Films

Welcome to a decentralized autonomous organization (DAO) built on the Stacks blockchain that empowers film enthusiasts to fund and influence independent cinema! Indie filmmakers often face funding barriers from traditional studios and investors, leaving passionate fans on the sidelines. This project solves this by letting fans pool resources, propose projects, vote with governance tokens, and directly support indie films—democratizing film production and giving creators access to community-driven capital.

## ✨ Features

🔗 Governance tokens for voting and staking  
💰 Crowdfunded treasury for film project grants  
📝 Proposal system for submitting indie film ideas  
🗳 Token-weighted voting on funding decisions  
🎞 Film milestone tracking and fund releases  
🏆 NFT rewards for backers and creators  
🔒 Secure, transparent DAO operations  
🚀 Automated royalty distributions from film success  

## 🛠 How It Works

This DAO uses Clarity smart contracts on the Stacks blockchain to ensure trustless, transparent operations. The system involves 8 core smart contracts (described below) that handle tokenomics, governance, funding, and rewards. Fans buy or earn tokens to participate, propose films, vote, and earn rewards.

**For Fans and Backers**  
- Acquire tokens via purchase or staking rewards.  
- Stake tokens to gain voting power.  
- Propose an indie film project with details like script summary, budget, and team.  
- Vote on proposals using your staked token weight.  
- If approved, contribute to the treasury for funding.  
- Receive NFT shares representing ownership in the film's success.  

**For Filmmakers**  
- Submit proposals through the DAO (or have fans propose on your behalf).  
- Receive funds in tranches based on milestones (e.g., pre-production, filming, post-production).  
- Report progress via oracle-verified updates.  
- Distribute royalties back to the DAO treasury upon film release and revenue.  

**For the Community**  
- Monitor proposals and votes in real-time.  
- Earn rewards from successful films through automated distributions.  
- Participate in governance upgrades via meta-proposals.  

That's it! Fans become co-producers, filmmakers get fair funding, and everyone wins from hit indie films.

## 📜 Smart Contracts Overview

This project is powered by 8 Clarity smart contracts for modularity and security:

1. **GovToken.clar**: ERC-20-like fungible token for governance tokens. Handles minting, burning, transfers, and balances.  
2. **Staking.clar**: Allows users to stake tokens for voting power and earn yield from the treasury.  
3. **Treasury.clar**: Manages pooled funds, accepts contributions, and releases funds for approved projects.  
4. **Proposal.clar**: Enables submission of film proposals with details (title, budget, team, milestones) and tracks status.  
5. **Voting.clar**: Facilitates token-weighted voting on proposals with a defined quorum and duration.  
6. **Milestone.clar**: Tracks project milestones, verifies progress via oracle inputs, and triggers fund releases.  
7. **NFTReward.clar**: Mints and distributes NFT shares to backers, representing fractional ownership in a film’s revenue.  
8. **Royalty.clar**: Automates royalty collection from film revenue and distributes profits to NFT holders and the treasury.

## 🛠 Technical Details

- **Language**: Clarity (Stacks blockchain) for secure, predictable smart contracts.  
- **Tokenomics**: Governance tokens are capped, with staking rewards funded by treasury yield.  
- **Security**: Contracts are audited, with access controls (e.g., only stakers vote, only verified milestones release funds).  
- **Oracle Integration**: External oracles verify milestone completion (e.g., production updates, revenue reports).  
- **Scalability**: Modular contracts allow easy upgrades via meta-proposals.  

## 🚀 Getting Started

1. **Deploy Contracts**: Deploy the 8 smart contracts on the Stacks blockchain.  
2. **Mint Tokens**: Initialize the GovToken contract with an initial token supply.  
3. **Stake Tokens**: Users stake tokens to participate in governance.  
4. **Submit Proposals**: Fans or filmmakers submit film ideas via the Proposal contract.  
5. **Vote and Fund**: Community votes on proposals; approved projects receive treasury funds.  
6. **Track and Reward**: Monitor milestones, distribute NFTs, and share royalties.  

## 🌟 Why This Matters

This DAO solves a real-world problem: indie filmmakers struggle to secure funding without compromising creative control. By leveraging blockchain, fans become stakeholders, filmmakers gain access to capital, and the community shares in the success of independent cinema. It’s a win-win for creators and fans, fostering a vibrant ecosystem for unique, passion-driven films.  

Get ready to fund the next cult classic! 🎬