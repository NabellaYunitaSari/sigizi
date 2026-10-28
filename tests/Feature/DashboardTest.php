<?php

namespace Tests\Feature;

use App\Models\Anak;
use App\Models\IbuHamil;
use App\Models\Imunisasi;
use App\Models\PengukuranAnak;
use App\Models\PengukuranBumil;
use App\Models\Posyandu;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use LazilyRefreshDatabase;

    #[TestWith(['admin'])]
    #[TestWith(['koordinator'])]
    public function test_combined_dashboard_shows_all_posyandus_by_default(string $role): void
    {
        $fixtures = $this->createDashboardData();
        $user = User::factory()->create(['role' => $role]);

        $this->actingAs($user)->get(route('dashboard.desa'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Desa')
                ->where('selectedPosyanduId', '')
                ->has('posyandus', 2)
                ->where('totalVillageAnak', 2)
                ->where('posyanduDashboard.totalAnak', 2)
                ->where('posyanduDashboard.totalBumil', 2)
                ->has('posyanduDashboard.childrenInPos', 2)
                ->where('posyanduDashboard.immunizationChartData.1.percentage', 50)
                ->where('posyanduDashboard.trimesterChartData.0.count', 1)
                ->where('posyanduDashboard.trimesterChartData.2.count', 1)
            );
    }

    #[TestWith(['admin'])]
    #[TestWith(['koordinator'])]
    public function test_posyandu_filter_scopes_all_detail_charts_without_changing_village_totals(string $role): void
    {
        $fixtures = $this->createDashboardData();
        $user = User::factory()->create(['role' => $role]);

        $this->actingAs($user)->get(route('dashboard.desa', ['posyandu' => $fixtures['selected']->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Desa')
                ->where('selectedPosyanduId', $fixtures['selected']->id)
                ->where('totalVillageAnak', 2)
                ->where('totalVillageBumil', 2)
                ->has('barChartData', 2)
                ->where('posyanduDashboard.totalAnak', 1)
                ->where('posyanduDashboard.totalBumil', 1)
                ->has('posyanduDashboard.childrenInPos', 1)
                ->where('posyanduDashboard.childrenInPos.0.id', $fixtures['child']->id)
                ->has('posyanduDashboard.bumilList', 1)
                ->where('posyanduDashboard.genderCompositionData.0.value', 1)
                ->where('posyanduDashboard.genderCompositionData.1.value', 0)
                ->where('posyanduDashboard.growthStatusChartData.0.count', 1)
                ->where('posyanduDashboard.growthStatusChartData.5.count', 0)
                ->where('posyanduDashboard.immunizationChartData.1.percentage', 100)
                ->where('posyanduDashboard.trimesterChartData.0.count', 1)
                ->where('posyanduDashboard.trimesterChartData.2.count', 0)
                ->has('posyanduDashboard.pmtAnakList', 0)
                ->has('posyanduDashboard.pmtBumilList', 0)
            );
    }

    public function test_partial_reload_returns_filtered_detail_props(): void
    {
        $fixtures = $this->createDashboardData();
        $user = User::factory()->create(['role' => 'admin']);
        $initialPage = $this->actingAs($user)->get(route('dashboard.desa'))->viewData('page');

        $this->actingAs($user)->get(route('dashboard.desa', ['posyandu' => $fixtures['selected']->id]), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $initialPage['version'],
            'X-Inertia-Partial-Component' => 'Dashboard/Desa',
            'X-Inertia-Partial-Data' => 'selectedPosyanduId,posyanduDashboard',
        ])->assertJsonPath('props.selectedPosyanduId', $fixtures['selected']->id)
            ->assertJsonPath('props.posyanduDashboard.totalAnak', 1)
            ->assertJsonMissingPath('props.totalVillageAnak');
    }

    #[TestWith(['admin'])]
    #[TestWith(['koordinator'])]
    public function test_old_posyandu_dashboard_redirects_managers_to_combined_dashboard(string $role): void
    {
        $user = User::factory()->create(['role' => $role]);

        $this->actingAs($user)->get(route('dashboard'))
            ->assertRedirectToRoute('dashboard.desa');
    }

    public function test_kader_cannot_change_their_posyandu_by_query_parameter(): void
    {
        $fixtures = $this->createDashboardData();
        $user = User::factory()->create(['id_pos' => $fixtures['selected']->id]);

        $this->actingAs($user)->get(route('dashboard', ['posyandu' => $fixtures['other']->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Index')
                ->where('totalAnak', 1)
                ->has('childrenInPos', 1)
                ->where('childrenInPos.0.id', $fixtures['child']->id)
                ->where('totalBumil', 1)
            );
    }

    public function test_kader_without_posyandu_does_not_receive_village_data(): void
    {
        $this->createDashboardData();
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Index')
                ->where('totalAnak', 0)
                ->where('totalBumil', 0)
            );
    }

    public function test_kader_cannot_open_village_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('dashboard.desa'))
            ->assertRedirectToRoute('dashboard');
    }

    #[TestWith(['not-a-uuid'])]
    #[TestWith(['00000000-0000-4000-8000-000000000000'])]
    public function test_invalid_or_unknown_posyandu_is_rejected(string $posyandu): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)->from(route('dashboard.desa'))
            ->get(route('dashboard.desa', ['posyandu' => $posyandu]))
            ->assertSessionHasErrors('posyandu');
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('dashboard.desa'))->assertRedirectToRoute('login');
    }

    /**
     * @return array{selected: Posyandu, other: Posyandu, child: Anak}
     */
    private function createDashboardData(): array
    {
        $selected = Posyandu::factory()->create(['nama_pos' => 'Anggrek']);
        $other = Posyandu::factory()->create(['nama_pos' => 'Melati']);
        $inputUser = User::factory()->create(['id_pos' => $selected->id]);
        $child = Anak::factory()->create(['id_pos' => $selected->id, 'jenis_kelamin' => 'L']);
        $otherChild = Anak::factory()->create(['id_pos' => $other->id, 'jenis_kelamin' => 'P']);
        PengukuranAnak::factory()->create(['id_anak' => $child->id, 'id_user_input' => $inputUser->id]);
        PengukuranAnak::factory()->create([
            'id_anak' => $otherChild->id,
            'id_user_input' => $inputUser->id,
            'status_tbu' => 'Pendek',
        ]);
        Imunisasi::factory()->create(['id_anak' => $child->id]);
        $mother = IbuHamil::factory()->create(['id_pos' => $selected->id]);
        $otherMother = IbuHamil::factory()->create(['id_pos' => $other->id]);
        PengukuranBumil::factory()->create(['id_bumil' => $mother->id, 'id_user_input' => $inputUser->id]);
        PengukuranBumil::factory()->create([
            'id_bumil' => $otherMother->id,
            'id_user_input' => $inputUser->id,
            'usia_kehamilan_minggu' => 30,
            'lila_cm' => 22,
            'status_gizi_bumil' => 'KEK',
        ]);

        return ['selected' => $selected, 'other' => $other, 'child' => $child];
    }
}
