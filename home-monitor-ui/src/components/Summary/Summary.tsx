import React, { useEffect, useState } from 'react';
import { DEMO_USER_ID, getSummaryStats } from '../../service/db-ops/plant-ops';

const Summary: React.FC = () => {
    const [stats, setStats] = useState({
        totalPlants: 0,
        healthyPlants: 0,
        needsAttention: 0,
    });

    const fetchSummary = async () => {
        try {
            const summary = await getSummaryStats(DEMO_USER_ID);
            if (summary) {
                setStats({
                    totalPlants: summary.totalPlants ?? 0,
                    healthyPlants: summary.healthyPlants ?? 0,
                    needsAttention: summary.needsAttention ?? 0,
                });
            }
        } catch (error) {
            console.error('Error fetching summary stats:', error);
        }
    };

    useEffect(() => {
        fetchSummary();

        const handleCollectionUpdated = () => {
            fetchSummary();
        };

        window.addEventListener('plant-collection-updated', handleCollectionUpdated);

        return () => {
            window.removeEventListener('plant-collection-updated', handleCollectionUpdated);
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <h1>Welcome to Home Monitor</h1>
                <div>
                    <h2>Quick Stats</h2>
                    <p>Total Plants: {stats.totalPlants}</p>
                    <p>Healthy Plants: {stats.healthyPlants}</p>
                    <p>Needs Attention: {stats.needsAttention}</p>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    padding: '10px',
                    borderTop: '1px solid #ccc',
                    backgroundColor: '#f8f8f8',
                }}
            >
            </div>
        </div>
    );
};

export default Summary;