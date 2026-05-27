import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/common/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import FocusPage from '@/pages/FocusPage'
import GoalsPage from '@/pages/GoalsPage'
import NotesPage from '@/pages/NotesPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectBoardPage from '@/pages/ProjectBoardPage'
import TasksManagePage from '@/pages/TasksManagePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/focus" replace />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="focus/manage" element={<TasksManagePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectBoardPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
