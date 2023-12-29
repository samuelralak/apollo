import {ComponentType} from 'react';
import AuthRequired from "../AuthRequired.tsx";

const withAuthRequired = (Component: ComponentType) => {
    return (
        <AuthRequired>
            <Component/>
        </AuthRequired>
    );
};

export default withAuthRequired

