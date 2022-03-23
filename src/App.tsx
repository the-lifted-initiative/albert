import React from "react"
import { Outlet } from "react-router"
import { Routes, Route } from "react-router-dom"
import { Layout } from "components"
import { SplashView, Home } from "./views"

const ONE_SECOND = 1 * 1000

function App() {
  const [showSplash, setShowSplash] = React.useState(true)
  React.useEffect(() => {
    let id = setTimeout(() => setShowSplash(false), ONE_SECOND)
    // without clearing timeout here, we get the "indicates a memory-leak in your application" warning.
    return () => clearTimeout(id)
  }, [])

  if (showSplash) {
    return <SplashView />
  }
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Outlet />
          </Layout>
        }
      >
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
