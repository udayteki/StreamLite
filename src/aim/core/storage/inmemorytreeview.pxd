# distutils: language = c++
# cython: language_level = 3

from aim.core.storage.treeview cimport TreeView

cdef class InMemoryTreeView(TreeView):
    cdef public container
    cdef public _constructed
