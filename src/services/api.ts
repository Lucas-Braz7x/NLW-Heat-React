import axios from 'axios';

/*Define a integração da API*/
export const api = axios.create({
  baseURL: 'http://localhost:4000',
})