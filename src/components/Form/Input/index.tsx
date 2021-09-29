import React from 'react';
import { TextInputProps } from 'react-native';

import {
    Container
} from './styles';

type Props = TextInputProps;

export function Input({ ...rest }: TextInputProps) {
    return (
        <Container {...rest}>

        </Container>
    )
}