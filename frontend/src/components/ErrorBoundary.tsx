import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('App crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, Arial, sans-serif' }}>
          <h1>Щось пішло не так</h1>
          <p>Замість білого екрана показується ця сторінка з помилкою.</p>
          <p>Відкрий консоль браузера, щоб побачити точну причину.</p>
        </div>
      )
    }

    return this.props.children
  }
}
