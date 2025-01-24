import React from 'react';

import { Home } from 'components/Main/Home';
import { MemeForm } from 'components/MemeForm';
import MemeList from 'src/components/MemeList';
import { FaqList } from 'components/Main/FaqList';
import { MainLayout } from 'layouts/MainLayout';
import { SolanaRepository } from 'connectors/repositories/solana';
import { PAGE_SIZE } from 'components/MemeList/constants';

import Typography from '@/components/Typography';
import { TYPOGRAPHY_VARIANTS } from '@/components/Typography/constants';

export const getServerSideProps = async (context) => {
  const page = context.query.page || 0;

  const initialData = await SolanaRepository.getTokens(`page=${page}&size=${PAGE_SIZE}`);

  return {
    props: {
      initialData
    }
  };
};

const HomePage = ({ initialData }) => {
  return (
    <MainLayout>
      <Home />
      <MemeForm isHomePage />
      <div className="w-full flex flex-col">
        <div className="flex flex-col items-center justify-center w-full mb-[60px] space-y-4 sm:space-y-1 sm:mb-6">
          <Typography className="text-white" variant={TYPOGRAPHY_VARIANTS.HEADER_H2} text="Generation history" />
          <Typography className="text-white-500" variant={TYPOGRAPHY_VARIANTS.BODY_L} text="People vote - we launch" />
        </div>
        <MemeList data={initialData} />
      </div>
      <FaqList />
    </MainLayout>
  );
};

export default HomePage;
