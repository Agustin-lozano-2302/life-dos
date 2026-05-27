import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/common/AppLayout'
import FocusPage from '@/pages/FocusPage'
import GoalsPage from '@/pages/GoalsPage'
import NotesPage from '@/pages/NotesPage'
import ProjectsPage from '@/pages/ProjectsPage'
import TasksManagePage from '@/pages/TasksManagePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/focus" replace />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="focus/manage" element={<TasksManagePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="notes" element={<NotesPage />} />
      </Route>
    </Routes>
  )
}
