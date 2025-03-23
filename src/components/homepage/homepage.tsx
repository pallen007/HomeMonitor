import React from 'react';
import { FaHome, FaLeaf, FaSearch, FaBook } from 'react-icons/fa';




const Homepage = () => {
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
                    <div>
                        <FaHome size={24} />
                        <p>Home</p>
                    </div>
                    <div>
                        <FaLeaf size={24} />
                        <p>Plants</p>
                    </div>
                    <div>
                        <FaSearch size={24} />
                        <p>Lookup</p>
                    </div>
                    <div>
                        <FaBook size={24} />
                        <p>Guides</p>
                    </div>
                </div>
            </div>
        )
    }


export default Homepage();