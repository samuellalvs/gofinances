import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import HighlightCard from '../../components/HighlightCard';

import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

export interface DataListProps extends TransactionCardProps {
    id: string;
}

import {
    Container,
    Header,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    UserWrapper,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer
} from './styles';

import { useAuth } from '../../hooks/auth';

interface HighlightProps {
    amount: string;
    lastTransaction: string;
}

interface HighlightData {
    entries: HighlightProps;
    expensive: HighlightProps;
    total: HighlightProps;
}

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

    const theme = useTheme();

    const { signOut, user } = useAuth();

    function getLastTransactionDate(collection: DataListProps[], type: 'positive' | 'negative') {
        const collectionFilttered = collection
            .filter(transaction => transaction.type === type);

        if (collectionFilttered.length === 0) {
            return 0;
        }

        const lastTransaction = new Date(
            Math.max.apply(Math,
                collectionFilttered
                    .map(transaction => new Date(transaction.date).getTime())
            )
        )

        return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', { month: 'long' })}`;
    }


    async function loadTransactions() {
        const dataKey = `@gofinances:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        console.log(transactions);

        const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
            if (item.type === 'positive') {
                entriesTotal += Number(item.amount);
            } else {
                expensiveTotal += Number(item.amount);
            }

            const amount = Number(item.amount).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date(item.date));

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date
            }
        });

        const total = entriesTotal - expensiveTotal;

        setTransactions(transactionsFormatted);

        const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive');
        const lastTransactionsExpensives = getLastTransactionDate(transactions, 'negative');
        const totalInterval = lastTransactionsExpensives === 0 ? 'N??o h?? transa????es' : `01 a ${lastTransactionsExpensives}`;

        setHighlightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionsEntries === 0 ? 'N??o h?? transa????es' : `??ltima entrada dia ${lastTransactionsEntries}`
            },
            expensive: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionsExpensives === 0 ? 'N??o h?? transa????es' : `??ltima sa??da dia ${lastTransactionsExpensives}`
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totalInterval
            }
        });

        setIsLoading(false);

    }

    useEffect(() => {
        loadTransactions();
    }, []);

    useFocusEffect(useCallback(() => {
        loadTransactions();
    }, []));

    return (
        <Container>
            {
                isLoading ?
                    <LoadContainer>
                        <ActivityIndicator
                            color={theme.colors.primary}
                            size="large"
                        />
                    </LoadContainer>

                    :
                    <>
                        <Header>
                            <UserWrapper>
                                <UserInfo>
                                    <Photo source={{ uri: user.photo }} />
                                    <User>
                                        <UserGreeting>
                                            Ol??,
                                        </UserGreeting>
                                        <UserName>
                                            {user.name}
                                        </UserName>
                                    </User>
                                </UserInfo>

                                <LogoutButton onPress={signOut}>
                                    <Icon name="power" />

                                </LogoutButton>

                            </UserWrapper>

                        </Header>

                        <HighlightCards>
                            <HighlightCard
                                title="Entradas"
                                amount={highlightData.entries.amount}
                                lastTransaction={highlightData.entries.lastTransaction}
                                type="up"
                            />
                            <HighlightCard
                                title="Sa??das"
                                amount={highlightData.expensive.amount}
                                lastTransaction={highlightData.expensive.lastTransaction}
                                type="down"
                            />
                            <HighlightCard
                                title="Total"
                                amount={highlightData.total.amount}
                                lastTransaction={highlightData.total.lastTransaction}
                                type="total"
                            />
                        </HighlightCards>

                        <Transactions>
                            <Title>
                                Listagem
                            </Title>

                            <TransactionList
                                data={transactions}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <TransactionCard data={item} />}

                            />

                        </Transactions>
                    </>
            }
        </Container>
    )
}
