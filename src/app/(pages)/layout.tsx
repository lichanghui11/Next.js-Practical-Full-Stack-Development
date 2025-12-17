import Header from '../_components/header';

export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      {children}
      {modal}
    </div>
  );
}
