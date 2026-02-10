export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-20">
        {children}
      </main>
    </div>
  );
}

