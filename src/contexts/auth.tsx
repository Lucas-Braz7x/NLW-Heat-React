import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';

/*Tipagens*/
type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;

}
type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
}
type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

/* Iniciando o contexto */
export const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;//Qualquer coisa aceita pelo react (elementoHTML, texto e etc)
}

//Exportando componente
export function AuthProvider(props: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=ff5fac4512cb8bb2082d`;

  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponse>('authenticate', {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem('@dowhile:token', token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;


    setUser(user);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  }

  /* Persiste o token na aplicação */
  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token');

    if (token) {
      /* Axios - Toda requisição daqui pra baixo vai com o token de autorização */
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api.get<User>('/profile').then(response => {
        setUser(response.data);
      });
    }
  }, [])

  //Verifica se a url tem o código do github
  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if (hasGithubCode) {
      //O que vem antes (de "?code=") fica na posição 0
      //O que vem depois fica na posição 1 
      const [urlWithoutCode, githubCode] = url.split('?code=');
      //console.log({ urlWithoutCode, githubCode })

      //Remove o código da url e força a navegação para a url determinada
      window.history.pushState({}, '', urlWithoutCode);

      //Envia código 
      signIn(githubCode);
    }
  }, [])

  return (
    /* Todos os componentes dentro dessa tag tem acesso as informações */
    <AuthContext.Provider value={{ user, signInUrl, signOut }}>
      {props.children}
    </ AuthContext.Provider>
  )
}