import {useUser} from "../../hooks/useUser"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import ThemedLoader from "../ThemedLoader"

const UserOnly = ({children}) => {
    const {user, loading} = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user === null) {
            router.replace('/')
        }
    }, [ user, loading])

    // We show a loading screen while User data is still loading
    if (loading || !user) {
        return (
            <ThemedLoader/>
        )
    }

    return children
}

export default UserOnly