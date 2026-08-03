import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import PortfolioHome from '../components/PortfolioHome';

export default function Home() {
  useDocusaurusContext();

  return (
    <Layout
      title="Sui Hsilan Portfolio"
      description="Sui 的後端、自動化與 AI 專案整合站"
    >
      <PortfolioHome />
    </Layout>
  );
}
