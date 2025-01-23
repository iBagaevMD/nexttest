import React from 'react';
import clsx from 'clsx';

const Divider = ({ className }) => {
  return <div className={clsx('rounded-[10px] w-full h-[1px] bg-white-100', className)} />;
};

export default Divider;
