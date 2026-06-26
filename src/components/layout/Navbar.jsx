function Navbar() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex justify-between items-center">

      <div>
        <h1 className="text-white text-3xl font-bold">
          AI Data Security Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3 text-white">
        <span className="text-2xl">👤</span>
        <span>Admin</span>
      </div>

    </div>
  );
}

export default Navbar;