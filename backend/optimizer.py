from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from typing import List, Optional


def solve_tsp(
    duration_matrix: List[List[float]],
    depot_index: int = 0,
    time_limit_seconds: int = 5
) -> Optional[List[int]]:

    n = len(duration_matrix)

    if n < 2:
        return [0]
    if n == 2:
        return [0, 1, 0]

    # OR-Tools requires integers — scale by 10 to keep 1 decimal precision
    int_matrix = [
        [int(duration_matrix[i][j] * 10) for j in range(n)]
        for i in range(n)
    ]

    manager = pywrapcp.RoutingIndexManager(n, 1, depot_index)
    routing = pywrapcp.RoutingModel(manager)

    def duration_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(duration_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.seconds = time_limit_seconds

    solution = routing.SolveWithParameters(search_params)

    if not solution:
        return list(range(n)) + [0]

    route = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        route.append(node)
        index = solution.Value(routing.NextVar(index))
    route.append(depot_index)

    return route


def calculate_savings(
    original_order: List[int],
    optimized_order: List[int],
    duration_matrix: List[List[float]]
) -> int:

    def total_duration(order: List[int]) -> float:
        total = 0.0
        for i in range(len(order) - 1):
            f, t = order[i], order[i + 1]
            if f < len(duration_matrix) and t < len(duration_matrix[f]):
                total += duration_matrix[f][t]
        return total

    naive = total_duration(original_order + [original_order[0]])
    optimized = total_duration(optimized_order)
    saved_seconds = max(0, naive - optimized)
    return int(saved_seconds / 60)
