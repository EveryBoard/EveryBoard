package utils

type Set[T comparable] map[T]struct{}

func NewSet[T comparable]() Set[T] {
	return make(Set[T])
}

func (set *Set[T]) Add(value T) {
	(*set)[value] = struct{}{}
}

func (set Set[T]) Exists(value T) bool {
	_, exists := set[value]
	return exists
}

func (set Set[T]) Remove(value T) {
	if set.Exists(value) {
		delete(set, value)
	}
}
