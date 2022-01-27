import {api} from '../../services/api';
import {io} from 'socket.io-client';

import styles from './styles.module.scss'

import logo from '../../assets/logo.svg'
import {useEffect, useState} from 'react';

type Message = {
    id: string;
    text: string;
    user: {
        name: string;
        avatar_url: string;
    };
}

const msgQueue: Message[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (msg: Message) => {
    msgQueue.push(msg);
})

export function MessageList() {
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        setInterval(() => {
            if (msgQueue.length) {
                setMessages(prevState => [
                    msgQueue[0],
                    prevState[0],
                    prevState[1]
                ].filter(v => v));

                msgQueue.shift();
            }
        }, 3000);
    }, []);

    useEffect(() => {
        // chamada para api

        api.get<Message[]>('messages/last3').then(response => {
            setMessages(response.data);
        })
    }, []);

    return (
        <div className={styles.messageListWrapper}>
            <img src={logo} alt="DoWhile 2021"/>

            <ul className={styles.messageList}>
                {messages.map(msg => {
                    return (
                        <li key={msg.id} className={styles.message}>
                            <p className={styles.messageContent}>
                                {msg.text}
                            </p>
                            <div className={styles.messageUser}>
                                <div className={styles.userImage}>
                                    <img src={msg.user?.avatar_url} alt={msg.user?.name}/>
                                </div>
                                <span>{msg.user?.name}</span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}