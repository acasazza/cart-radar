import { makeInstructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  HomePageLayout,
  List,
  ListItem,
  RadialProgress,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useCoreSdkProvider,
  useResourceFilters,
  useTranslation
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'
import { useListCounters } from '../metricsApi/useListCounters'

function Home(): React.JSX.Element {
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const { sdkClient } = useCoreSdkProvider()
  const search = useSearch()
  const { isLoading: isLoadingCounters } = useListCounters()

  const { adapters, SearchWithNav } = useResourceFilters({
    instructions: makeInstructions({})
  })

  return (
    <HomePageLayout
      title={"Cart Radar"}
      toolbar={{
        buttons: [
          {
            icon: 'plus',
            label: `${t('common.new')} ${t('resources.orders.name').toLowerCase()}`,
            size: 'small',
            onClick: () => {
              void sdkClient.markets
                .list({
                  fields: ['id'],
                  filters: {
                    disabled_at_null: true
                  },
                  pageSize: 1,
                  include: ['tags']
                })
                .then((markets) => {
                  if (markets.meta.recordCount > 1) {
                    setLocation(appRoutes.new.makePath({}))
                  } else {
                    const [resource] = markets
                    if (resource != null) {
                      void sdkClient.orders
                        .create({
                          market: {
                            type: 'markets',
                            id: resource.id
                          }
                        })
                        .then((order) => {
                          setLocation(
                            appRoutes.new.makePath({ orderId: order.id })
                          )
                        })
                    }
                  }
                })
            }
          }
        ]
      }}
    >
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.list.makePath({}, qs))
        }}
        queryString={search}
        searchBarDebounceMs={1000}
      />

      <SkeletonTemplate isLoading={isLoadingCounters}>
        <Spacer bottom='14'>
          <List title={"Abandoned Carts"}>
            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.pending
                })
              )}
              asChild
            >
              <ListItem icon={<RadialProgress size='small' />}>
                <Text weight='semibold'>{"Abandoned Carts"}</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>
      </SkeletonTemplate>
    </HomePageLayout>
  )
}

export default Home
