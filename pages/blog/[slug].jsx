import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { blogs } from 'helpers/blogs';
import { MainLayout } from 'src/layouts/MainLayout';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

const BlogPage = () => {
  const router = useRouter();
  const { slug } = router.query || 'investing-in-meme-coins';
  const blogKey = slug;

  const setTitle = (title) => {
    const el = document.querySelector('title');
    //@fixme
    // el.innerText = title;
  };

  const setDescription = (desc) => {
    const el = document.querySelector("meta[name='description']");
    el.setAttribute('content', desc);
  };

  useEffect(() => {
    if (blogs?.[blogKey]) {
      //@fixme
      // setTitle(blogs?.[blogKey]?.previewInfo?.title + ' | Rocket Blog');
      // setDescription(blogs?.[blogKey]?.previewInfo?.desc);
    }
  }, [blogKey]);

  const findArticles = () => {
    let next = 0;
    let prev = 0;
    const blogLength = Object.keys(blogs).length;
    const currentIndex = Object.keys(blogs).findIndex((item) => item === blogKey);

    prev = currentIndex - 1;
    next = currentIndex + 1;

    if (currentIndex === 0) {
      prev = blogLength - 1;
    }
    if (currentIndex === blogLength - 1) {
      next = 0;
    }

    return [Object.keys(blogs)[prev], Object.keys(blogs)[next]];
  };

  const renderSections = (section, itemIndex) => {
    return section.map((item) => {
      switch (item.type[0]) {
        case 'dotsList':
          return (
            <ul className="text-white-500 list-disc list-outside space-y-5 pl-5">
              {item.value.map((listItem, listItemIndex) => {
                return (
                  <li key={`${itemIndex}-${listItemIndex}`}>
                    <Typography
                      className="text-white-500 mb-5 sm:mb-4 last:!mb-0"
                      text={listItem}
                      variant={TYPOGRAPHY_VARIANTS.BODY_L}
                    />
                  </li>
                );
              })}
            </ul>
          );
        case 'numericList':
          return (
            <ol className="text-white-500 list-decimal list-outside space-y-5 pl-5">
              {item.value.map((listItem, listItemIndex) => {
                return (
                  <li key={`${itemIndex}-${listItemIndex}`}>
                    <Typography
                      className="text-white-500 mb-5 sm:mb-4 last:!mb-0"
                      text={listItem}
                      variant={TYPOGRAPHY_VARIANTS.BODY_L}
                    />
                  </li>
                );
              })}
            </ol>
          );
        case 'text':
          return (
            <Typography
              className="text-white-500 mb-5 sm:mb-4 last:!mb-0"
              text={item.value}
              variant={TYPOGRAPHY_VARIANTS.BODY_L}
            />
          );
        case 'italic-text':
          return (
            <Typography
              className="italic text-white-500 mb-5 sm:mb-4 last:!mb-0"
              text={item.value}
              variant={TYPOGRAPHY_VARIANTS.BODY_L}
            />
          );
        case 'title':
          return (
            <Typography
              type="h2"
              className="text-white mb-6 sm:mb-5 last:!mb-0"
              text={item.value}
              variant={TYPOGRAPHY_VARIANTS.HEADER_H3}
            />
          );
        case 'img':
          return (
            <img
              className="rounded-[8px] mb-5 sm:mb-4 last:!mb-0"
              src={item.value}
              alt={`img-${itemIndex}`}
            />
          );
        default:
          return <></>;
      }
    });
  };

  return (
    <MainLayout pageType="blogPage" isAvailable={!!blogs?.[blogKey]}>
      <main className="flex flex-col space-y-[48px] sm:space-y-[36px] max-w-[600px] w-full sm:max-w-full">
        <div className="mt-5 sm:mt-0">
          <div className="flex items-center justify-start space-x-2">
            <Link href="/blog" className="flex items-center justify-center space-x-1">
              <img className="w-6 h-6" src="/icons/arrowLeftGrey.svg" alt="arrow left disable" />
              <Typography
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                className="text-white-300"
                text="Blog"
              />
            </Link>
            <div className="h-[15px] w-[0px] border-[0.5px] border-solid border-white opacity-30"></div>
            <Typography
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              className="text-white"
              // text={blogs?.[blogKey].previewInfo.title} //@fixme
              text={''}
            />
          </div>
        </div>
        <Typography
          type="h1"
          className="!mt-9 sm:!mt-6 text-white"
          // text={blogs?.[blogKey].main.title}//@fixme
          text={''}
          variant={TYPOGRAPHY_VARIANTS.HEADER_H2}
        />
        {/*@fixme*/}
        {/*{blogs?.[blogKey]?.main?.sections?.map((item, itemIndex) => {*/}
        {/*  return (*/}
        {/*    <div*/}
        {/*      className="flex flex-col items-start justify-start space-y-5 space-y-reverse"*/}
        {/*      key={`section-${itemIndex}`}>*/}
        {/*      {renderSections(item, itemIndex)}*/}
        {/*    </div>*/}
        {/*  );*/}
        {/*})}*/}
        <div className="flex items-center justify-between w-full">
          <Link
            href={'/blog/' + findArticles()[0]}
            className="flex items-center justify-center space-x-1 opacity-50 hover:opacity-100">
            <img className="rotate-180" src="/icons/arrowRightWhite.svg" alt="icon prev" />
            <Typography
              variant={TYPOGRAPHY_VARIANTS.BODY_M}
              className="text-white"
              text="Last article"
            />
          </Link>
          <Link
            href={'/blog/' + findArticles()[1]}
            className="flex items-center justify-center space-x-1">
            <Typography
              variant={TYPOGRAPHY_VARIANTS.BODY_M}
              className="text-white"
              text="Next article"
            />
            <img src="/icons/arrowRightWhite.svg" alt="icon next" />
          </Link>
        </div>
      </main>
    </MainLayout>
  );
};

export default BlogPage;
