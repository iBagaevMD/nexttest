import React from 'react';

const openChat = () => {
  if (typeof window !== 'undefined') return;
  if (window.jivo_api) {
    jivo_api.open();
  } else {
    window.open('https://t.me/suppport_rl', '_blank');
  }
};

export const INFO = [
  {
    title: 'What is Rocket Launcher?',
    desc: (
      <span>
        Rocket Launcher Token Creator is a smart contract that allows anyone to create tokens on
        Solana and TON. You can customise supply, name, symbol, description and image. No coding
        experience needed.
        <br /> <br />
        All of it faster and cheaper than any other option - we use automation to cut the costs.
      </span>
    )
  },
  {
    title: 'What can I do with Rocket Launcher?',
    desc: (
      <span>
        You can create tokens with V3 Raydium pools.
        <br /> <br />
        You can generate memecoins with our AI if you are lazy.
        <br /> <br />
        You can create your own token on TON, and trade any token created on rocket launcher.
      </span>
    )
  },
  {
    title: 'How much time will it take to launch my token?',
    desc: (
      <span>
        The time depends on how busy Solana or TON is at the moment, but it usually takes just a few
        seconds. If you have any issues, we are here for you.{' '}
        <button className="underline" onClick={() => openChat()}>
          Ping us in the Support chat.
        </button>
      </span>
    )
  },
  {
    title: 'How much will it cost?',
    desc: <span>V3 pool creation costs 0.49 sol.</span>
  },
  {
    title: 'Where can I find my tokens?',
    desc: (
      <span>
        If you create your token with lp V3 on Raydium, you can find it on Dextools, Birdeye and
        Geckoterminal. Dexscreener does not support V3 pools yet. You can trade your tokens on
        Raydium.
        <br /> <br />
        You can find all the links in My Memes section.
      </span>
    )
  },
  {
    title: 'Which wallet can I use?',
    desc: (
      <span>
        Phantom and Coinbase for SOLANA
        <br /> <br />
        Tonkeeper for TON
      </span>
    )
  },
  {
    title: 'How can I buy or sell tokens on the TON chain?',
    desc: (
      <span>
        You simply go to the rocket launcher trade section, find a token you want to buy, using CA
        or symbol. Then you press SWAP and sign the transaction in your Tonkeeper wallet.
      </span>
    )
  },
  {
    title: 'Why is there a sale limit for tokens created on the TON chain?',
    desc: (
      <span>
        Because the token lacks liquidity. In this case, the maximum amount of tokens available for
        sale will be shown in the swapper.
      </span>
    )
  },
  {
    title: "I created a token but it's not showing up in the market.",
    desc: (
      <span>
        After confirming the transaction in your wallet, the token launch needs some time to
        process. Usually, it takes no more than 5 minutes.
      </span>
    )
  },
  {
    title: 'What is Rocket Launcher Meme Generator?',
    desc: (
      <span>
        Rocket Launcher is the tool for launching your memecoin as easy as saying pump. You can
        generate an idea AND an image for free and then launch it in several clicks on Raydium. No
        coding or hard work required.
      </span>
    )
  }
];
