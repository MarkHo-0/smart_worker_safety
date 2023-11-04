enum SortingMethod {
  status(value: 0, name: "工作狀態"),
  position(value: 1, name: "崗位"),
  workingTime(value: 2, name: "連續工作時間");

  final int value;
  final String name;

  const SortingMethod({
    required this.value,
    required this.name,
  });
}
