import api from './http';

export const getPopulationTrend = (region) =>
    api.get('/api/population/trend', { params: { region } })
        .then(r => r.data);
