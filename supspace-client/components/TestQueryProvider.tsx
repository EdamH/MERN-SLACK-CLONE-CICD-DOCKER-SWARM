import { ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

type TestQueryProviderProps = {
  children: ReactNode;
};

const TestQueryProvider: React.FC<TestQueryProviderProps> = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

export default TestQueryProvider;