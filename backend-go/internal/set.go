package internal

type Set[T comparable] map[T]struct{}

func (set *Set[T]) Add(value T) {
	(*set)[value] = struct{}{}
}

func (set *Set[T]) Exists(value T) bool {
	_, exists := (*set)[value]
	return exists
}
