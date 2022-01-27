import {createContext, ReactNode, useEffect, useState} from 'react';
import {api} from '../services/api';
import axios from 'axios';

type AuthResp = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    };
};

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
};

type AuthContextData = {
    user: User | null;
    signInUrl: string;
    signOut: () => void;
};

type AuthProvider = {
    children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProvider) {
    const [user, setUser] = useState<User | null>(null);

    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=edc5073ea3c806dedc3c`;

    async function signIn(githubCode: string) {
        const resp = await api.post<AuthResp>('authenticate', {
            code: githubCode
        })
        const {token, user} = resp.data;

        api.defaults.headers.common.authorization = `Bearer ${token}`;

        localStorage.setItem('@dowhile:token', token);
        setUser(user)
    }

    async function signOut() {
        setUser(null);
        localStorage.removeItem('@dowhile:token');
    }

    useEffect(() => {
        const token = localStorage.getItem('@dowhile:token')
        if (token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`;
            api.get<User>('profile').then(resp => {
                setUser(resp.data);
            })
        }
    }, [])

    useEffect(() => {
        const url = window.location.href;
        const hasGithubCode = url.includes('?code=');
        if (hasGithubCode) {
            const [urlWithoutCode, githubCode] = url.split('?code=');

            window.history.pushState({}, '', urlWithoutCode);
            signIn(githubCode)
        }
    }, [])


    return (
        <AuthContext.Provider value={{signInUrl, user, signOut}}>
            {props.children}
        </AuthContext.Provider>
    );
}