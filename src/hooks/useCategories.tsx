
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // TODO: Implement with Neon DB
      console.log('Fetching categories');
      
      // Mock categories for now
      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'Green Tea',
          description: 'Green tea products',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat-2',
          name: 'Black Tea',
          description: 'Black tea products',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData: { name: string; description?: string }) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can add categories.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // TODO: Implement with Neon DB
      console.log('Add category:', categoryData);

      toast({
        title: "Category Added",
        description: `${categoryData.name} category has been added.`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateCategory = async (id: string, updates: { name?: string; description?: string }) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can update categories.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // TODO: Implement with Neon DB
      console.log('Update category:', id, updates);

      toast({
        title: "Category Updated",
        description: "Category has been updated successfully.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user || !['admin', 'owner'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admin and owner can delete categories.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // TODO: Implement with Neon DB
      console.log('Delete category:', id);

      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};
