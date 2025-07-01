import React, { Suspense } from 'react'
import AnalyzePageComponent from './_components'

const AnalyzePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyzePageComponent />
    </Suspense>
  )
}

export default AnalyzePage