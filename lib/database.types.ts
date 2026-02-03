export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          role: 'admin' | 'teacher'
          full_name: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          role?: 'admin' | 'teacher'
          full_name?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          role?: 'admin' | 'teacher'
          full_name?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      academic_years: {
        Row: {
          id: string
          name: string
          status: 'open' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'open' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'open' | 'closed'
          created_at?: string
        }
      }
      bimesters: {
        Row: {
          id: string
          year_id: string
          number: number
          status: 'open_fill' | 'closed'
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          id?: string
          year_id: string
          number: number
          status?: 'open_fill' | 'closed'
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          id?: string
          year_id?: string
          number?: number
          status?: 'open_fill' | 'closed'
          start_date?: string | null
          end_date?: string | null
        }
      }
      levels: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
      }
      grades: {
        Row: { id: string; level_id: string; name: string }
        Insert: { id?: string; level_id: string; name: string }
        Update: { id?: string; level_id?: string; name?: string }
      }
      sections: {
        Row: { id: string; grade_id: string; name: string }
        Insert: { id?: string; grade_id: string; name: string }
        Update: { id?: string; grade_id?: string; name?: string }
      }
      courses: {
        Row: { id: string; name: string; active: boolean }
        Insert: { id?: string; name: string; active?: boolean }
        Update: { id?: string; name?: string; active?: boolean }
      }
      teachers: {
        Row: { id: string; profile_id: string; active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; profile_id: string; active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; profile_id?: string; active?: boolean; created_at?: string; updated_at?: string }
      }
      students: {
        Row: {
          id: string
          student_code: string | null
          dni: string | null
          first_names: string
          last_names: string
          grade_id: string
          section_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_code?: string | null
          dni?: string | null
          first_names: string
          last_names: string
          grade_id: string
          section_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_code?: string | null
          dni?: string | null
          first_names?: string
          last_names?: string
          grade_id?: string
          section_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      teacher_assignments: {
        Row: {
          id: string
          year_id: string
          teacher_id: string
          course_id: string
          grade_id: string
          section_id: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          year_id: string
          teacher_id: string
          course_id: string
          grade_id: string
          section_id?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          year_id?: string
          teacher_id?: string
          course_id?: string
          grade_id?: string
          section_id?: string | null
          active?: boolean
          created_at?: string
        }
      }
      qualitative_grades: {
        Row: {
          id: string
          bimester_id: string
          assignment_id: string
          student_id: string
          value: 'AD' | 'A' | 'B' | 'C'
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          bimester_id: string
          assignment_id: string
          student_id: string
          value: 'AD' | 'A' | 'B' | 'C'
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          bimester_id?: string
          assignment_id?: string
          student_id?: string
          value?: 'AD' | 'A' | 'B' | 'C'
          updated_by?: string | null
          updated_at?: string
        }
      }
      attendance_bimester: {
        Row: {
          id: string
          bimester_id: string
          student_id: string
          attendances: number
          absences: number
          justifications: number
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          bimester_id: string
          student_id: string
          attendances?: number
          absences?: number
          justifications?: number
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          bimester_id?: string
          student_id?: string
          attendances?: number
          absences?: number
          justifications?: number
          updated_by?: string | null
          updated_at?: string
        }
      }
    }
  }
}
