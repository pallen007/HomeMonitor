import React from 'react';
import { FaHome, FaLeaf, FaSearch, FaBook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
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
                    <Link to="/">
                        <FaHome size={24} />
                        <p>Home</p>
                    </Link>
                </div>
                <div>
                    <Link to="/plants">
                        <FaLeaf size={24} />
                        <p>Plants</p>
                    </Link>
                </div>
                <div>
                    <Link to="/lookup">
                        <FaSearch size={24} />
                        <p>Lookup</p>
                    </Link>
                </div>
                <div>
                    <Link to="/guides">
                        <FaBook size={24} />
                        <p>Guides</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Homepage;