'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { SPRING_BASE_URL } from '../../api/api';
import axios from 'axios';

const ImportExportVat = () => {
    const { user, token } = useAuth();


     // Parse JWT token to get company information
     const parseJwt = (token: string): any => {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
          return null;
        }
      };

    useEffect(() => {
        const fetchImportExportVat = async () => {
           
            if (!token) {
                console.log('there is no token please login.');
                return;
            }

            console.log('[ImportExportVat] token present, length:', token?.length);

            const decodedToken = parseJwt(token);
            console.log('[ImportExportVat] decodedToken:', decodedToken);
            const userId = decodedToken?.user_id;
            if (!userId) {
               
                return;
            }

            try {
                //console.log('[ImportExportVat] sending request to:', `${SPRING_BASE_URL}/clerk/report/${userId}`);
                const response = await axios.get(`${SPRING_BASE_URL}/clerk/report/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('[ImportExportVat] response:', response.data);
            } catch (error) {
                console.error('[ImportExportVat] request error:', error);
            }
        };

        fetchImportExportVat();
    }, [user, token]);

    return <div>ImportExportVat</div>;
};

export default ImportExportVat;