import React from 'react';




const Summary: React.FC = () => {


    const getSummaryStats = () => {
        // TODO: implement caching and a service worker to replace this when I have time

    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <h1>Welcome to Home Monitor</h1>
                <div>
                    <h2>Quick Stats</h2>
                    <p>Total Plants: 15</p>
                    <p>Healthy Plants: 12</p>
                    <p>Needs Attention: 3</p>
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