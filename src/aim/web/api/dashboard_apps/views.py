import json
import os

from fastapi import Depends, HTTPException
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from sqlalchemy.orm import Session

from aim.web.api.dashboard_apps.models import ExploreState
from aim.web.api.dashboard_apps.pydantic_models import (
    ExploreStateCreateIn,
    ExploreStateUpdateIn,
    ExploreStateGetOut,
    ExploreStateListOut,
    AppStateGetOut
)
from aim.web.api.dashboard_apps.serializers import explore_state_response_serializer
from aim.web.api.db import get_session

dashboard_apps_router = APIRouter()


@dashboard_apps_router.get('/', response_model=ExploreStateListOut)
async def dashboard_apps_list_api(session: Session = Depends(get_session)):
    explore_states = session.query(ExploreState).filter(ExploreState.is_archived == False)  # noqa
    result = []
    for es in explore_states:
        result.append(explore_state_response_serializer(es))
    return result


@dashboard_apps_router.get('/app/', response_model=AppStateGetOut)
async def dashboard_apps_app_api():
    app_path = os.environ["AIM_APP_PATH"]

    python_files = []
    files_contents = {}

    # Traverse files and directories, collect python scripts
    for root, _, files in os.walk(app_path):
        for file in files:
            if file.endswith('.py'):
                rel_path = os.path.relpath(os.path.join(root, file), app_path)
                python_files.append(rel_path)

    # Load contents
    for file_path in python_files:
        with open(os.path.join(app_path, file_path), 'r') as file:
            contents = file.read()
            files_contents[file_path] = contents

    result = {
        'app_path': app_path,
        'app_dir_name': os.path.basename(app_path),
        'files': python_files,
        'files_contents': files_contents,
    }

    return result


@dashboard_apps_router.post('/', status_code=201, response_model=ExploreStateGetOut)
async def dashboard_apps_create_api(explore_state_in: ExploreStateCreateIn, session: Session = Depends(get_session)):
    explore_state = ExploreState()
    explore_state.type = explore_state_in.type
    explore_state.state = json.dumps(explore_state_in.state)

    session.add(explore_state)
    session.commit()

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.get('/{app_id}/', response_model=ExploreStateGetOut)
async def dashboard_apps_get_api(app_id: str, session: Session = Depends(get_session)):
    explore_state = session.query(ExploreState) \
        .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
        .first()
    if not explore_state:
        raise HTTPException(status_code=404)

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.put('/{app_id}/', response_model=ExploreStateGetOut)
async def dashboard_apps_put_api(app_id: str, explore_state_in: ExploreStateUpdateIn,
                                 session: Session = Depends(get_session)):
    explore_state = session.query(ExploreState) \
        .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
        .first() # noqa
    if not explore_state:
        raise HTTPException(status_code=404)

    if explore_state_in.type:
        explore_state.type = explore_state_in.type
    if explore_state_in.state:
        explore_state.state = json.dumps(explore_state_in.state)

    session.commit()

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.delete('/{app_id}/')
async def dashboard_apps_delete_api(app_id: str, session: Session = Depends(get_session)):
    explore_state = session.query(ExploreState) \
        .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
        .first()  # noqa
    if not explore_state:
        raise HTTPException(status_code=404)

    explore_state.is_archived = True
    session.commit()
