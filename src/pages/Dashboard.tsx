import React from 'react';
import './Dashboard.css'; // Assuming you have some CSS for styling

const Dashboard = () => {
    return (
        <div className="p-3 sm:p-4">
            <h1 className="text-2xl sm:text-3xl">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <div className="flex flex-col items-center bg-white shadow-md rounded-lg">
                    <h2 className="text-lg font-medium">Stat 1</h2>
                    <p className="text-xl">Value</p>
                </div>
                <div className="flex flex-col items-center bg-white shadow-md rounded-lg">
                    <h2 className="text-lg font-medium">Stat 2</h2>
                    <p className="text-xl">Value</p>
                </div>
                <div className="flex flex-col items-center bg-white shadow-md rounded-lg">
                    <h2 className="text-lg font-medium">Stat 3</h2>
                    <p className="text-xl">Value</p>
                </div>
                <div className="flex flex-col items-center bg-white shadow-md rounded-lg">
                    <h2 className="text-lg font-medium">Stat 4</h2>
                    <p className="text-xl">Value</p>
                </div>
                {/* Add more stats cards as needed */}
            </div>
        </div>
    );
};

export default Dashboard;
