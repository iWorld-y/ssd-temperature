package utils

func Sample[T any](list []T, n int) []T {
	if n <= 0 {
		return nil
	}
	if n >= len(list) {
		return list
	}
	result := make([]T, 0, n)
	step := len(list) / n
	for i := range n {
		result = append(result, list[i*step])
	}
	return result
}
