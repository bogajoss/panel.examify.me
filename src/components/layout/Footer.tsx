export function Footer() {
  return (
    <footer className="bg-background border-t py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">AntiGravity</span> Question Bank.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-xs text-muted-foreground">
              Built with <span className="text-foreground">Next.js</span> & <span className="text-foreground">Appwrite</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
