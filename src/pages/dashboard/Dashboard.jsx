function Dashboard() {
  return (
    <div className="bg-slate-950 min-h-screen p-8">

      <h1 className="text-white text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-slate-900 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
          <p className="text-gray-400">Total Scans</p>
          <h1 className="text-white text-4xl mt-2">1247</h1>
          <p className="text-green-400 mt-2">
            +12% this week
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
          <p className="text-gray-400">High Risk</p>
          <h1 className="text-red-400 text-4xl mt-2">31</h1>
          <p className="text-red-300 mt-2">
            Critical Files
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
          <p className="text-gray-400">Masked Files</p>
          <h1 className="text-blue-400 text-4xl mt-2">892</h1>
          <p className="text-green-400 mt-2">
            Successfully Protected
          </p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;