import React from 'react';

import { Home } from 'components/Main/Home';
import { MemeForm } from 'components/MemeForm';
import MemeList from 'src/components/MemeList';
import { FaqList } from 'components/Main/FaqList';
import { MainLayout } from 'layouts/MainLayout';
import { SolanaRepository } from 'connectors/repositories/solana';
import { PAGE_SIZE } from 'components/MemeList/constants';

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
      <MemeList data={initialData} />
      <FaqList />
    </MainLayout>
  );
};

export default HomePage;
