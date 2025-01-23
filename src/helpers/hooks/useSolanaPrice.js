import { useState, useEffect } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SOL_PRICE = 150;

const useSolanaPrice = () => {
  const [price, setPrice] = useState(DEFAULT_SOL_PRICE);

  const fetchSolanaPrice = async () => {
    const endpoints = [
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      'https://api.coincap.io/v2/assets/solana'
    ];

    for (let url of endpoints) {
      try {
        console.log('Fetching Solana price...');
        const response = await fetch(url);
        const data = await response.json();
        if (url.includes('coingecko')) {
          return data.solana.usd;
        } else if (url.includes('coincap')) {
          return data.data.priceUsd;
        }
      } catch (error) {
        console.error(`Failed to fetch SOL price from ${url}:`, error);
      }
    }
    // If all endpoints fail, return default price:
    return DEFAULT_SOL_PRICE; // TODO: replace with on-chain fallback logic
  };

  useEffect(() => {
    const cachedPrice = sessionStorage.getItem('solPrice');
    const cacheTime = sessionStorage.getItem('solPriceCacheTime');

    if (cachedPrice && new Date().getTime() - cacheTime < CACHE_DURATION) {
      setPrice(parseFloat(cachedPrice));
    } else {
      fetchSolanaPrice()
        .then((fetchedPrice) => {
          setPrice(fetchedPrice);
          sessionStorage.setItem('solPrice', fetchedPrice);
          sessionStorage.setItem('solPriceCacheTime', new Date().getTime());
        })
        .catch((_) => {});
    }
  }, []);

  return price;
};

export default useSolanaPrice;
