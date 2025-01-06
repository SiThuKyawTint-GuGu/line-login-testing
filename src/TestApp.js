import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch customers when the component mounts
    useEffect(() => {
        // API URL pointing to your Fastify server
        const apiUrl = 'http://localhost:3000/api/customers';  // Update with your correct endpoint

        // Call the Fastify API
        axios.get(apiUrl)
            .then((response) => {
                // Update state with the response data
                setCustomers(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="App">
            <h1>Customers</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {customers.map((customer) => (
                        <li key={customer.id}>{customer.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;
