import React, { useEffect } from 'react';

import { MainLayout } from 'src/layouts/MainLayout';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { blogs } from 'helpers/blogs';
import { BlogCard } from 'components/BlogCard';

const Blog = () => {
  const setTitle = (title) => {
    const el = document.querySelector('title');
    // el.innerText = title;
  };

  const setDescription = (desc) => {
    const el = document.querySelector("meta[name='description']");
    el.setAttribute('content', desc);
  };

  useEffect(() => {
    setTitle('Crypto blog on RocketLauncher');
    setDescription(
      'Actual articles and guides on launching meme coins on the Solana and TON platforms'
    );
  }, []);

  return (
    <MainLayout pageType="blogList">
      <div className="flex flex-col space-y-3 text-center max-w-[580px] w-full mb-9">
        <Typography
          className="text-white"
          variant={TYPOGRAPHY_VARIANTS.BODY_H2}
          text="Crypto blog on Rocketlauncher"
        />
        <Typography
          className="text-white-500"
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
          text="Actual articles and guides on launching meme coins on the Solana and TON platforms"
        />
      </div>
      <div className="w-full grid grid-cols-3 justify-items-center gap-x-3 gap-y-6 px-6 sm:px-6 sm:grid-cols-1">
        {Object.values(blogs).map((item, itemIndex) => {
          return <BlogCard url={item.key} info={item.previewInfo} itemIndex={itemIndex} />;
        })}
      </div>
    </MainLayout>
  );
};

export default Blog;
