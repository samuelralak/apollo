import {ReactNode} from 'react';
import {useSelector} from 'react-redux';
import {Navigate, useLocation} from 'react-router';
import {RootState} from "../../../app/store";

const AuthRequired = ({children}: { children: ReactNode }) => {
    const location = useLocation();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);

    if (!isAuthenticated) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return children;
};

export default AuthRequired
