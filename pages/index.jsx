import React from 'react';

import { Home } from 'components/Main/Home';
import { MemeForm } from 'components/MemeForm';
import { FaqList } from 'components/Main/FaqList';
import { MainLayout } from 'layouts/MainLayout';
import { MemeList } from 'components/Main/MemeList';

const HomePage = () => {
  return (
    <MainLayout>
      <Home />
      <MemeForm isHomePage />
      <MemeList />
      <FaqList />
    </MainLayout>
  );
};

export default HomePage;
